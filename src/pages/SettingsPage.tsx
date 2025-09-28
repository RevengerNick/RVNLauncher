import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center flex flex-col items-center">
                <Cog6ToothIcon className="size-16" />
                <h1 className="text-2xl font-bold">Настройки находятся в разработке</h1>
                <p className="text-gray-500 mt-2">Пожалуйста, вернитесь позже.</p>
            </div>
        </div>
    );
}   