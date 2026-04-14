import { Button } from '@mui/material';
import type { StyleSpecification } from 'maplibre-gl';
import { useContext, useEffect, useState } from 'react';
import LayerContext from '../../contexts/LayerContext';
import mapContextDecorator from '../../decorators/EmptyMapDecorator';
import { LayerListItemFactory, MonokaiStyle } from '../../index';
import LayerList from '../LayerList/LayerList';
import SelectStyleButton from '../SelectStyleButton/SelectStyleButton';
import Sidebar from '../Sidebar';
import TopToolbar from '../TopToolbar';

const storyoptions = {
	title: 'UiComponents/SelectStyleButton',
	component: SelectStyleButton,
	argTypes: {},
	decorators: mapContextDecorator,
};
export default storyoptions;

const SelectStyleTemplate: any = () => {
	const layerContext = useContext(LayerContext);
	const [openSidebar, setOpenSidebar] = useState(true);

	useEffect(() => {
		layerContext.updateStyle(MonokaiStyle as StyleSpecification);
	}, []);

	return (
		<>
			<TopToolbar
				buttons={
					<Button
						variant={openSidebar ? 'contained' : 'outlined'}
						onClick={() => setOpenSidebar(!openSidebar)}
						sx={{ marginRight: { xs: '0px', sm: '10px' } }}
					>
						Sidebar
					</Button>
				}
			/>
			<Sidebar open={openSidebar} setOpen={setOpenSidebar} name={'Layers'}>
				<SelectStyleButton />
				<LayerList>
					<LayerListItemFactory layers={[]} />
				</LayerList>
			</Sidebar>
		</>
	);
};
export const SelectStyleButtonExample = SelectStyleTemplate.bind({});

SelectStyleButtonExample.parameters = {};
SelectStyleButtonExample.args = {};
