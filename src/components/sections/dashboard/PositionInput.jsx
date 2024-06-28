import { Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
import React from "react";

function PositionInput({ label, value, setValue, type = "number" }) {
  return (
    <Field className={"w-full flex justify-between items-center gap-2"}>
      <Label className="text-sm w-14 font-medium text-white text-nowrap ">
        {label}
      </Label>

      <Input
        className={clsx(
          "block w-full rounded-lg border border-custom3 py-1 px-2 text-sm text-white bg-custom2 ",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
        )}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Field>
  );
}

export default PositionInput;
