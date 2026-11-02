import { Icon } from "@/components/shared/icon/Icon";

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px]">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5">
          <Icon name="check" size={18} strokeWidth={2.4} className="text-success" />
          {item}
        </li>
      ))}
    </ul>
  );
}
