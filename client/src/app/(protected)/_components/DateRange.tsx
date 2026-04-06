import { useEffect } from "react";
import { Controller, type Control, type UseFormSetValue, type UseFormWatch } from "react-hook-form";

import DateComponent from "./DateComponent";

interface IFormInput {
  startDate?: Date | null;
  endDate?: Date | null;
}

interface DateRangeProps {
  fromName: keyof IFormInput;
  toName: keyof IFormInput;
  control: Control<IFormInput>;
  watch: UseFormWatch<IFormInput>;
  setValue: UseFormSetValue<IFormInput>;
  labelFrom?: string;
  labelTo?: string;
}

const DateRange: React.FC<DateRangeProps> = ({
  fromName,
  toName,
  control,
  watch,
  setValue,
  labelFrom = "From",
  labelTo = "To",
}) => {
  const watchFrom = watch(fromName);
  const watchTo = watch(toName);

  useEffect(() => {
    if (watchFrom && watchTo && watchFrom > watchTo) {
      setValue(toName, null);
    }
  }, [watchFrom, watchTo, setValue, toName]);

  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          {labelFrom}
        </label>
        <Controller
          name={fromName}
          control={control}
          render={({ field }) => (
            <DateComponent
              startDate={field.value ?? null}
              setStartDate={field.onChange}
              isMinDate
            />
          )}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          {labelTo}
        </label>
        <Controller
          name={toName}
          control={control}
          render={({ field }) => (
            <DateComponent
              startDate={field.value ?? null}
              setStartDate={field.onChange}
              isMinDate
              minDate={watchFrom}
            />
          )}
        />
      </div>
    </>
  );
};

export default DateRange;
