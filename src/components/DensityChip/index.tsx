import classNames from "@/utils/classnames"
import { CellSignalMedium } from "@phosphor-icons/react"
import { CellSignalHigh, CellSignalLow } from "@phosphor-icons/react/dist/ssr"

const colors = {
    low: "bg-green-500",
    medium: "bg-yellow",
    high: "bg-red-600"
}

const icons = {
    low: <CellSignalLow size={20} weight="bold" />,
    medium: <CellSignalMedium size={20}  weight="bold" />,
    high: <CellSignalHigh size={20} weight="bold"  />
}

export default function DensityChip({ density }: { density: "low" | "medium" | "high"}) {
    return (
        <div className={classNames("w-[24px] flex items-center justify-center h-[24px] rounded-[4px]", colors[density])}>
            {icons[density]}
        </div>
    )
}