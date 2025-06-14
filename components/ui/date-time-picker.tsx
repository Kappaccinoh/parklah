"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Simple Calendar component since we don't need the full features
const Calendar = ({ 
  selected, 
  onSelect,
  initialFocus,
  mode = "single"
}: { 
  selected: Date, 
  onSelect: (date: Date | undefined) => void,
  initialFocus?: boolean,
  mode?: "single"
}) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const [month, setMonth] = React.useState(currentMonth)
  const [year, setYear] = React.useState(currentYear)
  
  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }
  
  // Get first day of month (0=Sunday, 1=Monday, etc)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }
  
  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)
  
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }
  
  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }
  
  const handleSelectDate = (day: number) => {
    const selectedDate = new Date(year, month, day)
    onSelect(selectedDate)
  }
  
  const isSelectedDay = (day: number) => {
    if (!selected) return false
    return (
      selected.getDate() === day &&
      selected.getMonth() === month &&
      selected.getFullYear() === year
    )
  }
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  // Render calendar days
  const days = []
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>)
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = isSelectedDay(day)
    const isToday = 
      day === now.getDate() && 
      month === now.getMonth() && 
      year === now.getFullYear()
    
    days.push(
      <button
        key={`day-${day}`}
        className={`p-2 rounded-md text-sm ${isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'border border-primary' : 'hover:bg-accent'}`}
        onClick={() => handleSelectDate(day)}
      >
        {day}
      </button>
    )
  }
  
  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePrevMonth}
          className="p-1 rounded-md hover:bg-accent"
        >
          &lt;
        </button>
        <div>
          {monthNames[month]} {year}
        </div>
        <button 
          onClick={handleNextMonth}
          className="p-1 rounded-md hover:bg-accent"
        >
          &gt;
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  )
}

interface DateTimePickerProps {
  value: Date
  onChange: (date: Date) => void
  className?: string
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date>(value)

  // Sync the date when value prop changes
  React.useEffect(() => {
    setDate(value)
  }, [value])

  // Update the parent when date changes
  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return
    
    // Create a new date with current time values
    const updatedDate = new Date(newDate)
    updatedDate.setHours(date.getHours())
    updatedDate.setMinutes(date.getMinutes())
    
    setDate(updatedDate)
    onChange(updatedDate)
  }

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = e.target.value
    if (!timeString) return
    
    const [hours, minutes] = timeString.split(':').map(Number)
    
    const newDate = new Date(date)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)
    
    setDate(newDate)
    onChange(newDate)
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <input
        type="time"
        value={format(date, "HH:mm")}
        onChange={handleTimeChange}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  )
}
