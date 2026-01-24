"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, GripVertical } from "lucide-react"

interface GridItem {
  id: string
  name: string
  thumbnail?: string
}

interface SortableItemProps {
  item: GridItem
  onRemove: (id: string) => void
}

function SortableItem({ item, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border bg-background p-2 transition-shadow ${
        isDragging ? "z-10 shadow-lg ring-2 ring-primary" : "hover:shadow-md"
      }`}
    >
      <button
        type="button"
        className="absolute left-2 top-2 cursor-grab touch-none rounded p-1 opacity-0 transition-opacity hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
        aria-label={`drag to reorder ${item.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="absolute right-2 top-2 rounded p-1 opacity-0 transition-opacity hover:bg-destructive hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
        aria-label={`remove ${item.name}`}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative aspect-[3/4] overflow-hidden rounded bg-muted">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            loading...
          </div>
        )}
      </div>

      <p className="mt-2 truncate text-center text-xs text-muted-foreground" title={item.name}>
        {item.name}
      </p>
    </div>
  )
}

interface SortableGridProps {
  items: GridItem[]
  onReorder: (items: GridItem[]) => void
  onRemove: (id: string) => void
}

export function SortableGrid({ items, onReorder, onRemove }: SortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      onReorder(arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          }}
          role="list"
          aria-label="sortable items"
        >
          {items.map((item) => (
            <SortableItem key={item.id} item={item} onRemove={onRemove} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
