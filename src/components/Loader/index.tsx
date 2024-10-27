import classNames from "@/utils/classnames"

interface LoaderProps {
    fullScreen?: boolean
}

export default function Loader({ fullScreen = false }: LoaderProps)  {
    return (
        <div className={classNames("w-full flex relative items-center justify-center", fullScreen ? "min-h-screen" : "")}>
            <div className="loader loader-1 bg-secondary" />
            <div className="loader loader-2 bg-blue" />
        </div>
    )
}