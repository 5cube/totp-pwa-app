import { resolve, parse } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import fg from 'fast-glob'
import { normalizePath, Plugin, HtmlTagDescriptor, ModuleNode } from 'vite'

function toKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

// функция получения компонентов входного модуля
// TODO добавить условие seen для исключения цикла
function modulesImportedByEntries(
  entryModule: ModuleNode,
  componentsDir: string,
  componentsModulesIds: Set<string>,
) {
  const importedModules = entryModule.clientImportedModules
  if (importedModules.size === 0) {
    return
  }
  for (const importedMod of Array.from(importedModules.values())) {
    if (importedMod.id?.startsWith(componentsDir)) {
      componentsModulesIds.add(importedMod.id)
    }
    if (
      importedMod.clientImportedModules.size &&
      !importedMod.importers.has(entryModule)
    ) {
      modulesImportedByEntries(importedMod, componentsDir, componentsModulesIds)
    }
  }
}

async function resolveTemplates(
  srcDir: string,
  tags: Map<string, HtmlTagDescriptor>,
) {
  const allTemplateFilesIds = await fg(['**.html'], {
    cwd: srcDir,
    onlyFiles: true,
    absolute: true,
  })
  for await (const id of allTemplateFilesIds) {
    const { name } = parse(id)
    const template = await createTemplateTag(id, name)
    tags.set(id.replace('.html', '.ts'), template)
  }
}

async function createTemplateTag(id: string, name: string) {
  const file = await readFile(id, 'utf-8')
  const templateId = `${toKebabCase(name)}-template`
  const templateContent = file.replace(/<\/?template>/gi, '').trim()
  return {
    tag: 'template',
    attrs: { id: templateId },
    children: templateContent,
    injectTo: 'body',
  } as HtmlTagDescriptor
}

export function customElementTemplateInjectPlugin(): Plugin {
  let isBuild = false
  let rootDir = process.cwd()
  let srcDir = resolve(rootDir, 'src')
  let componentsDir = resolve(rootDir, 'src/components')
  let templatesTags = new Map<string, HtmlTagDescriptor>()
  const entryModulesIdsMap = new Map<string, Set<string>>()

  return {
    name: 'custom-element-template-inject-plugin',
    enforce: 'pre',
    async configResolved(resolvedConfig) {
      isBuild = resolvedConfig.command === 'build'
      rootDir = resolvedConfig.root
      srcDir = resolve(resolvedConfig.root, 'src')
      componentsDir = resolve(resolvedConfig.root, 'src/components')

      // инициализация Map с входными модулями на основе инпутов
      for (const entry of Object.values(
        resolvedConfig.build.rollupOptions.input || {},
      )) {
        entryModulesIdsMap.set(entry, new Set())
      }

      // transformIndexHtml запускается до загрузки модулей
      // в дев сервере в начале подгружаем все шаблоны
      if (!isBuild) {
        await resolveTemplates(componentsDir, templatesTags)
      }
    },
    resolveId(source, importer) {
      // для дев сервера формируется Map с входными модулями
      if (
        !isBuild &&
        source.endsWith('.ts') &&
        importer &&
        entryModulesIdsMap.has(importer)
      ) {
        const normalizedId = source.startsWith(rootDir)
          ? source
          : source.startsWith('/')
          ? normalizePath(resolve(rootDir, source.replace(/^\//, '')))
          : normalizePath(resolve(srcDir, source.replace(/^\//, '')))

        entryModulesIdsMap.get(importer)!.add(normalizedId)
      }
    },
    async load(id) {
      // при билде подгружаются шаблоны при загрузке модулей
      if (isBuild && id.startsWith(componentsDir) && id.endsWith('.ts')) {
        const { name } = parse(id)
        const fileId = id.replace('.ts', '.html')
        if (existsSync(fileId)) {
          const template = await createTemplateTag(fileId, name)
          templatesTags.set(id, template)
        }
      }
    },
    transformIndexHtml(html, ctx) {
      const tags: HtmlTagDescriptor[] = []
      const importedModulesIds = new Set<string>()
      if (ctx.server) {
        if (ctx.server.moduleGraph.idToModuleMap.size) {
          entryModulesIdsMap.get(ctx.filename)?.forEach((id) => {
            const m = ctx.server!.moduleGraph.getModuleById(id)
            if (m) {
              modulesImportedByEntries(m, componentsDir, importedModulesIds)
            }
          })
        } else {
          // transformIndexHtml запускается до загрузки модулей
          // и при первом запуске idToModuleMap пустой
          Array.from(templatesTags.keys()).forEach((id) => {
            importedModulesIds.add(id)
          })
        }
      } else {
        const { chunk } = ctx
        chunk?.moduleIds?.forEach((id) => {
          if (id.startsWith(componentsDir)) {
            importedModulesIds.add(id)
          }
        })
      }
      importedModulesIds.forEach((id) => {
        const template = templatesTags.get(id)
        if (template) {
          tags.push(template)
        }
      })
      return {
        html,
        tags,
      }
    },
    async handleHotUpdate(ctx) {
      // TODO нужно получить обновленный файл
      if (ctx.file.startsWith(componentsDir) && ctx.file.endsWith('.html')) {
        ctx.server.ws.send({
          type: 'full-reload',
          path: '*',
        })
      }
    },
  }
}
