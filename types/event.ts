export interface StaffAssignment {
  category_id: string
  count: number
}

export interface Event {
  id: string
  title: string
  description: string | null
  date: string // ISO date string
  start_time: string | null // HH:MM format
  end_time: string | null // HH:MM format
  location: string | null
  status: string
  guest_count: number | null // Number of guests/people expected
  price_per_person: number | null // Price per person for the event
  staffAssignments: StaffAssignment[]
  created_at: string
  updated_at: string
}
