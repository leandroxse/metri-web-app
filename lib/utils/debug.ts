// Sistema de Debug para Console do Navegador - Supabase
// Use no console: window.MetriDebug.log('teste') ou window.MetriDebug.events()

import { eventService, categoryService, personService } from '@/lib/supabase/services'

interface DebugSystem {
  log: (message: string, data?: any) => void
  events: () => void
  categories: () => void
  people: () => void
  localStorage: () => void
  teamManager: (eventId: string) => void
  clearAll: () => void
  help: () => void
}

class MetriDebugger implements DebugSystem {
  private isDev = process.env.NODE_ENV === 'development'

  log(message: string, data?: any) {
    if (typeof window === 'undefined') return
    
    console.group(`🔧 METRI DEBUG: ${message}`)
    if (data) {
      console.log('Data:', data)
    }
    console.log('Timestamp:', new Date().toISOString())
    console.log('URL:', window.location.pathname)
    console.groupEnd()
  }

  async events() {
    if (typeof window === 'undefined') return
    
    try {
      const events = await eventService.getAll()
      
      console.group('📅 EVENTOS DEBUG (Supabase)')
      console.log('Total eventos:', events?.length || 0)
      console.table(events)
      console.groupEnd()
      
      return events
    } catch (error) {
      console.error('❌ Erro ao buscar eventos do Supabase:', error)
    }
  }

  async categories() {
    if (typeof window === 'undefined') return
    
    try {
      const categories = await categoryService.getAll()
      
      console.group('🏷️ CATEGORIAS DEBUG (Supabase)')
      console.log('Total categorias:', categories?.length || 0)
      console.table(categories)
      console.groupEnd()
      
      return categories
    } catch (error) {
      console.error('❌ Erro ao buscar categorias do Supabase:', error)
    }
  }

  async people() {
    if (typeof window === 'undefined') return
    
    try {
      const people = await personService.getAll()
      
      console.group('👥 PESSOAS DEBUG (Supabase)')
      console.log('Total pessoas:', people?.length || 0)
      console.table(people)
      console.groupEnd()
      
      return people
    } catch (error) {
      console.error('❌ Erro ao buscar pessoas do Supabase:', error)
    }
  }

  localStorage() {
    if (typeof window === 'undefined') return
    
    console.group('💾 LOCALSTORAGE DEBUG')
    
    const eventTeams: Record<string, any> = {}
    const otherItems: Record<string, any> = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      
      const value = localStorage.getItem(key)
      
      if (key.startsWith('event-team-')) {
        try {
          eventTeams[key] = JSON.parse(value || '[]')
        } catch {
          eventTeams[key] = value
        }
      } else {
        otherItems[key] = value
      }
    }
    
    console.log('📋 Event Teams:')
    console.table(eventTeams)
    console.log('📦 Other Items:')
    console.table(otherItems)
    console.groupEnd()
    
    return { eventTeams, otherItems }
  }

  teamManager(eventId: string) {
    if (typeof window === 'undefined') return
    
    console.group(`👥 TEAM MANAGER DEBUG - Event: ${eventId}`)
    
    // Check localStorage team
    const savedTeam = localStorage.getItem(`event-team-${eventId}`)
    console.log('💾 Saved Team:', savedTeam ? JSON.parse(savedTeam) : 'None')
    
    // Check categories
    this.categories().then(categories => {
      console.log('🏷️ Categories available:', categories?.length || 0)
    })
    
    // Check people
    this.people().then(people => {
      console.log('👥 People available:', people?.length || 0)
    })
    
    console.groupEnd()
  }

  clearAll() {
    if (typeof window === 'undefined') return
    
    console.group('🗑️ CLEAR ALL DEBUG')
    
    // Clear event teams from localStorage
    const keys = Object.keys(localStorage)
    const eventTeamKeys = keys.filter(key => key.startsWith('event-team-'))
    
    eventTeamKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`Removed: ${key}`)
    })
    
    console.log(`Cleared ${eventTeamKeys.length} event teams`)
    console.groupEnd()
  }

  help() {
    console.group('🚀 METRI DEBUG HELP')
    console.log('Available commands (Supabase):')
    console.log('• MetriDebug.events() - List all events from Supabase')
    console.log('• MetriDebug.categories() - List all categories from Supabase') 
    console.log('• MetriDebug.people() - List all people from Supabase')
    console.log('• MetriDebug.localStorage() - Show localStorage data')
    console.log('• MetriDebug.teamManager("event-id") - Debug team manager for specific event')
    console.log('• MetriDebug.clearAll() - Clear all event teams from localStorage')
    console.log('• MetriDebug.log("message", data) - Custom debug log')
    console.groupEnd()
  }
}

// Criar instância global
export const metriDebugger = new MetriDebugger()

// Adicionar ao window para acesso global no console
if (typeof window !== 'undefined') {
  ;(window as any).MetriDebug = metriDebugger
  metriDebugger.log('Debug system loaded (Supabase)! Type MetriDebug.help() for commands')
}