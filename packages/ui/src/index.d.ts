import type { ChangeEvent, FormEvent, ReactNode } from "react";

/** How full a slot or day is. Drives the colour of the status dot. */
export type SlotStatus = "available" | "limited" | "full";

/** Which action a slot offers. `blocked` means the consecutive-slot rule
 *  would reject this booking — distinct from `full`, which means no capacity. */
export type SlotCardState = "open" | "mine" | "full" | "blocked" | "past";

export interface SelectOption {
  value: string;
  label: string;
}

export interface TabItem {
  id: string;
  label: string;
}

export interface LegendItem {
  status: SlotStatus;
  label: string;
}

export interface Guest {
  name: string;
  relationship?: string;
  /** Total people this guest brings, including themselves. */
  visitorCount?: number;
}

export interface CalendarCell {
  /** Day of month. Omitted when `empty` is true. */
  day?: number;
  status?: SlotStatus;
  today?: boolean;
  past?: boolean;
  selected?: boolean;
  /** A leading blank before the first of the month. Renders nothing. */
  empty?: boolean;
}

/* ---------------------------------------------------------------- *
 * Primitives
 * ---------------------------------------------------------------- */

export interface ButtonProps {
  /** `book` and `full` are slot-card actions; `full` is always disabled. */
  variant?: "primary" | "link" | "danger" | "book" | "full";
  /** Defaults to "button" so a button inside a form never submits by accident. */
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
  children?: ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;

export interface CardProps {
  centered?: boolean;
  className?: string;
  children?: ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;

export interface TextFieldProps {
  id?: string;
  /** Omit to render the input with no label element. */
  label?: string;
  type?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  inputMode?: string;
  autoComplete?: string;
}
export declare function TextField(props: TextFieldProps): JSX.Element;

export interface SelectFieldProps {
  id?: string;
  label?: string;
  options?: SelectOption[];
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}
export declare function SelectField(props: SelectFieldProps): JSX.Element;

export interface ModalProps {
  title?: string;
  subtitle?: string;
  /** Called by the close button and by clicking the backdrop. */
  onClose?: () => void;
  children?: ReactNode;
}
export declare function Modal(props: ModalProps): JSX.Element;

export interface ToastProps {
  /** Renders nothing when empty. */
  message?: string;
  tone?: "default" | "error";
}
export declare function Toast(props: ToastProps): JSX.Element | null;

export interface ChipProps {
  children?: ReactNode;
}
export declare function Chip(props: ChipProps): JSX.Element;

export interface TabsProps {
  tabs?: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
}
export declare function Tabs(props: TabsProps): JSX.Element;

export interface EmptyStateProps {
  children?: ReactNode;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;

export interface EmojiHeroProps {
  emoji?: string;
}
export declare function EmojiHero(props: EmojiHeroProps): JSX.Element;

export interface FormErrorProps {
  /** Renders nothing when empty. */
  children?: ReactNode;
}
export declare function FormError(props: FormErrorProps): JSX.Element | null;

/* ---------------------------------------------------------------- *
 * Domain
 * ---------------------------------------------------------------- */

export interface StatusDotProps {
  status?: SlotStatus;
}
export declare function StatusDot(props: StatusDotProps): JSX.Element;

export interface LegendBarProps {
  items?: LegendItem[];
}
export declare function LegendBar(props: LegendBarProps): JSX.Element;

export interface WeekdayRowProps {
  /** Seven single-letter weekday initials, Sunday first. */
  days?: string[];
}
export declare function WeekdayRow(props: WeekdayRowProps): JSX.Element;

export interface PagerNavProps {
  label?: string;
  onPrev?: () => void;
  onNext?: () => void;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
}
export declare function PagerNav(props: PagerNavProps): JSX.Element;

export interface AppHeaderProps {
  title?: string;
  emoji?: string;
  /** Already-composed badge text, e.g. "Aunt Maria · Auntie". */
  profileName?: string;
  editLabel?: string;
  /** Omit to hide the edit button entirely. */
  onEditProfile?: () => void;
}
export declare function AppHeader(props: AppHeaderProps): JSX.Element;

export interface DayCellProps extends CalendarCell {
  /** Not called for past days. */
  onClick?: () => void;
}
export declare function DayCell(props: DayCellProps): JSX.Element;

export interface CalendarGridProps {
  cells?: CalendarCell[];
  onSelectDay?: (day: number) => void;
}
export declare function CalendarGrid(props: CalendarGridProps): JSX.Element;

export interface GuestListProps {
  guests?: Guest[];
  /** `chips` renders "Name · Relationship (+2)"; `inline` renders
   *  "Name (Relationship)" comma-joined, for use inside a modal. */
  variant?: "chips" | "inline";
  /** Text placed before the names in the `inline` variant. */
  inlinePrefix?: string;
}
export declare function GuestList(props: GuestListProps): JSX.Element | null;

export interface SlotCardProps {
  /** Display time, already formatted, e.g. "9:00 AM". */
  time?: string;
  statusText?: string;
  guests?: Guest[];
  state?: SlotCardState;
  /** Label for whichever action this state renders. */
  actionLabel?: string;
  /** Tooltip explaining why a `blocked` slot cannot be booked. */
  actionTitle?: string;
  onBook?: () => void;
  onCancel?: () => void;
}
export declare function SlotCard(props: SlotCardProps): JSX.Element;

export interface BookingRowProps {
  dateLabel?: string;
  atLabel?: string;
  timeLabel?: string;
  /** Shown only when the booking covers more than one person. */
  visitorsLabel?: string;
  past?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
}
export declare function BookingRow(props: BookingRowProps): JSX.Element;

/* ---------------------------------------------------------------- *
 * Screens
 * ---------------------------------------------------------------- */

export interface PinGateProps {
  emoji?: string;
  title?: string;
  prompt?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  /** Validation is the caller's job; this only displays what it is given. */
  error?: string;
}
export declare function PinGate(props: PinGateProps): JSX.Element;

export interface ProfileSetupProps {
  emoji?: string;
  heading?: string;
  subtitle?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  name?: string;
  onNameChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  relationshipLabel?: string;
  relationshipOptions?: SelectOption[];
  relationship?: string;
  onRelationshipChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  cancelLabel?: string;
  /** Omit to hide the cancel button (first-time setup). */
  onCancel?: () => void;
}
export declare function ProfileSetup(props: ProfileSetupProps): JSX.Element;

export interface MyBookingsTabProps {
  heading?: string;
  bookings?: (BookingRowProps & { id: string })[];
  emptyMessage?: string;
}
export declare function MyBookingsTab(props: MyBookingsTabProps): JSX.Element;

export interface CalendarTabProps {
  monthLabel?: string;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  prevMonthAriaLabel?: string;
  nextMonthAriaLabel?: string;
  weekdays?: string[];
  cells?: CalendarCell[];
  onSelectDay?: (day: number) => void;
  legendItems?: LegendItem[];
}
export declare function CalendarTab(props: CalendarTabProps): JSX.Element;

export interface DayTabProps {
  dayLabel?: string;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  prevDayAriaLabel?: string;
  nextDayAriaLabel?: string;
  /** Explanatory line under the pager, e.g. the consecutive-slot limit. */
  note?: string;
  slots?: (SlotCardProps & { id: string })[];
}
export declare function DayTab(props: DayTabProps): JSX.Element;

export interface BookingModalProps {
  title?: string;
  subtitle?: string;
  guests?: Guest[];
  guestsPrefix?: string;
  visitorLabel?: string;
  visitorOptions?: SelectOption[];
  visitorCount?: string;
  onVisitorCountChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  onClose?: () => void;
}
export declare function BookingModal(props: BookingModalProps): JSX.Element;
