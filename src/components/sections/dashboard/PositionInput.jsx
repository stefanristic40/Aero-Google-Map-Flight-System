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
  unit = null,
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

        <div className="relative w-full flex gap-1 justify-between rounded-lg border border-custom3 py-1 text-white bg-custom2 ">
          <Input
            className={clsx(
              "block w-full pl-2 text-sm bg-transparent ",
              "focus:outline-none "
            )}
            type={type}
            value={value}
            onChange={
              type === "datetime-local" ? handleDateChange : (e) => setValue(e)
            }
          />
          <div className="pr-1 ">{unit}</div>
        </div>
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
