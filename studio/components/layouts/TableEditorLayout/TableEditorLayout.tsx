import { FC, ReactNode, useEffect } from 'react'
import { noop } from 'lodash'
import { observer } from 'mobx-react-lite'
import type { PostgresTable } from '@supabase/postgres-meta'
import { PermissionAction } from '@supabase/shared-types/out/constants'

import { checkPermissions, useParams, useStore } from 'hooks'
import Error from 'components/ui/Error'
import ProjectLayout from '../ProjectLayout/ProjectLayout'
import TableEditorMenu from './TableEditorMenu'
import NoPermission from 'components/ui/NoPermission'

interface Props {
  selectedSchema?: string
  onSelectSchema: (schema: string) => void
  onAddTable: () => void
  onEditTable: (table: PostgresTable) => void
  onDeleteTable: (table: PostgresTable) => void
  onDuplicateTable: (table: PostgresTable) => void
  children: ReactNode
}

const TableEditorLayout: FC<Props> = ({
  selectedSchema,
  onSelectSchema = noop,
  onAddTable = noop,
  onEditTable = noop,
  onDeleteTable = noop,
  onDuplicateTable = noop,
  children,
}) => {
  const { vault, meta, ui } = useStore()
  const { id, type } = useParams()

  const canReadTables = checkPermissions(PermissionAction.TENANT_SQL_ADMIN_READ, 'tables')

  const vaultExtension = meta.extensions.byId('supabase_vault')
  const isVaultEnabled = vaultExtension !== undefined && vaultExtension?.installed_version !== null

  useEffect(() => {
    if (ui.selectedProject?.ref) {
      meta.schemas.load()
      meta.types.load()
      meta.policies.load()
      meta.publications.load()
      meta.extensions.load()

      // [Joshen] pg-meta doesn't support loading views nor foreign tables by a specific ID yet
      // Separately, Alaister and I chatted that perhaps we leverage on pg-catalog's pg-class
      // table directly, so we can fetch the schema of tables/views/foreign-tables in one call
      // rather than trying to discern if the ID is a view, or foreign table (refer to below)
      meta.views.load()
      meta.foreignTables.load()
    }
  }, [ui.selectedProject?.ref])

  useEffect(() => {
    if (selectedSchema && ui.selectedProject?.ref) {
      meta.tables.loadBySchema(selectedSchema)
      meta.views.loadBySchema(selectedSchema)
    }
  }, [ui.selectedProject?.ref, selectedSchema])

  useEffect(() => {
    if (ui.selectedProject?.ref && id) {
      // [Joshen] This is a little silly, but because fetching tables/views/foreign-tables
      // are all through different endpoints, we need to discern them
      if (type !== 'view' && type !== 'foreign') {
        meta.tables.loadById(Number(id))
      }
    }
  }, [ui.selectedProject?.ref, id])

  useEffect(() => {
    if (isVaultEnabled) {
      vault.load()
    }
  }, [ui.selectedProject?.ref, isVaultEnabled])

  if (!canReadTables) {
    return (
      <ProjectLayout showGlobalSpinner={false} isLoading={false}>
        <NoPermission isFullPage resourceText="view tables from this project" />
      </ProjectLayout>
    )
  }

  return (
    <ProjectLayout
      showGlobalSpinner={false}
      isLoading={false}
      product="Table editor"
      productMenu={
        <TableEditorMenu
          selectedSchema={selectedSchema}
          onSelectSchema={onSelectSchema}
          onAddTable={onAddTable}
          onEditTable={onEditTable}
          onDeleteTable={onDeleteTable}
          onDuplicateTable={onDuplicateTable}
        />
      }
    >
      {children}
    </ProjectLayout>
  )
}

export default observer(TableEditorLayout)
