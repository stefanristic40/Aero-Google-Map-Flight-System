import { Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
import React from "react";
import { formatDate, formatDateHM } from "../../../utils";

function PositionInput({
  label,
  value,
  setValue,
  type = "number",
  min = null,
  max = null,
}) {
  const [error, setError] = React.useState(null);

  // Function to handle date change
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const maxDate = new Date(max);
    const minDate = new Date(min);

    setError(null);
    // Check if the selected date is within the allowed range
    if (type === "datetime-local" && selectedDate < minDate) {
      setError(`Date must be after ${formatDate(min)} ${formatDateHM(min)}`);
      return false;
    } else if (type === "datetime-local" && selectedDate > maxDate) {
      setError(`Date must be before ${formatDate(max)} ${formatDateHM(max)}`);
      return false;
    }

    setValue(e.target.value);
  };

  return (
    <>
      <Field className={"w-full flex justify-between items-center gap-2"}>
        <Label className="text-sm w-14 text-right font-medium text-white text-nowrap ">
          {label}
        </Label>

        <Input
          className={clsx(
            "block w-full rounded-lg border border-custom3 py-1 px-2 text-sm text-white bg-custom2 ",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
          )}
          type={type}
          value={value}
          onChange={
            type === "datetime-local" ? handleDateChange : (e) => setValue(e)
          }
        />
      </Field>
      {error && (
        <div className="text-xs text-red-500 text-right font-normal">
          {error}
        </div>
      )}
    </>
  );
}

export default PositionInput;
