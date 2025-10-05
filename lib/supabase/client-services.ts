// Client services para usar diretamente nos hooks
// Exporta com o mesmo nome que o SQLite para facilitar a migração

import { categoryService, personService, eventService, eventStaffService, paymentService, eventTeamService } from './services'
import { menuService } from './menu-services'

// Re-exportar com os nomes esperados pelos hooks
export const categoryClientService = categoryService
export const personClientService = personService
export const eventClientService = eventService
export const eventStaffClientService = eventStaffService
export const paymentClientService = paymentService
export const eventTeamClientService = eventTeamService
export const menuClientService = menuService

// Compatibilidade com a estrutura antiga de tipos
export type { Category, Person, Event, EventStaff, Payment } from './client'