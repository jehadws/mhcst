import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface KeyValueInputProps {
  value: { key: string; value: string }[];
  onChange: (value: { key: string; value: string }[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export default function KeyValueInput({
  value,
  onChange,
  keyPlaceholder = "key",
  valuePlaceholder = "Value",
}: KeyValueInputProps) {
  const handleAdd = () => {
    onChange([...value, { key: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleKeyChange = (index: number, newKey: string) => {
    const newValue = [...value];
    newValue[index].key = newKey;
    onChange(newValue);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const newValues = [...value];
    newValues[index].value = newValue;
    onChange(newValues);
  };

  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <Input
            type="text"
            value={item.key}
            onChange={(e) => handleKeyChange(index, e.target.value)}
            placeholder={keyPlaceholder}
          />
          <Input
            type="text"
            value={item.value}
            onChange={(e) => handleValueChange(index, e.target.value)}
            placeholder={valuePlaceholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAdd}
      >
        <Plus className="h-4 w-4 mr-2" />
        إضافة المزيد
      </Button>
    </div>
  );
}
