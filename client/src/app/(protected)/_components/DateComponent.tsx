import { Dispatch, SetStateAction } from "react";
import { FiCalendar } from "react-icons/fi";

interface DateProps {
  startDate: Date | null;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  isMinDate?: boolean;
  isMaxDate?: boolean;
  minDate?: Date | null;
  isDisabled?: boolean;
}

const toInputDate = (date: Date | null | undefined) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DateComponent = ({
  isMinDate,
  startDate,
  setStartDate,
  minDate,
  isMaxDate,
  isDisabled,
}: DateProps) => {
  const today = toInputDate(new Date());
  const minValue = !isMinDate ? today : toInputDate(minDate) || undefined;
  const maxValue = isMaxDate ? today : undefined;

  return (
    <div className="relative">
      <FiCalendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
      <input
        type="date"
        value={toInputDate(startDate)}
        disabled={isDisabled}
        min={minValue}
        max={maxValue}
        onChange={(event) =>
          setStartDate(
            event.target.value ? new Date(`${event.target.value}T00:00:00`) : null
          )
        }
        className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </div>
  );
};

export default DateComponent;
