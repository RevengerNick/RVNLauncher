import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
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
      <TabGroup>
        <TabList className="flex space-x-1 rounded-xl bg-secondary/50 p-1">
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
                      ? 'bg-secondary text-text-primary shadow'
                      : 'text-text-primary hover:bg-white/[0.12] hover:text-text-primary'
                  )}
                >
                  {tab.title}
                </button>
              )}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="mt-4">
          {tabs.map((tab, idx) => (
            <TabPanel
              key={idx}
              className={classNames(
                'rounded-xl bg-secondary p-4',
                'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-secondary ring-text-primary ring-opacity-60'
              )}
            >
              {tab.content}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}