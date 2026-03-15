import { useState } from 'react';
import type { JSX, ReactNode } from 'react';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import { Box } from '@mui/material';

interface TabPanelProps {
  children: ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps): JSX.Element {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface TabItem {
  label: string;
  content: ReactNode;
}

interface TabsContainerProps {
  tabs: TabItem[];
}

function TabsContainer({ tabs }: TabsContainerProps): JSX.Element {
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  return (
    <Box>
      <MuiTabs
        value={value}
        onChange={handleChange}
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
          },
        }}
      >
        {tabs.map((tab, index) => (
          <MuiTab key={index} label={tab.label} />
        ))}
      </MuiTabs>
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
}

export default TabsContainer;
