import { Tab } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

interface TabItem {
  title: string;
  content: ReactNode;
}

interface GamePageTabsProps {
  tabs: TabItem[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function GamePageTabs({ tabs }: GamePageTabsProps) {
  return (
    <div className="w-full">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-700/50 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.title}
              as={Fragment}
            >
              {({ selected }) => (
                <button
                  className={classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'focus:outline-none  ring-opacity-60',
                    selected
                      ? 'bg-blue-500 text-white shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )}
                >
                  {tab.title}
                </button>
              )}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                'rounded-xl bg-gray-800 p-4',
                'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60'
              )}
            >
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}