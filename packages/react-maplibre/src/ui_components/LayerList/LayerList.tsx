import { List, styled } from '@mui/material';
import type React from 'react';

const ListStyled = styled(List)({
	marginTop: '15px',
});
interface LayerListProps {
	mapId?: string;
	children?: React.JSX.Element | React.JSX.Element[];
}

function LayerList(props: LayerListProps) {
	return <ListStyled>{props?.children}</ListStyled>;
}

export default LayerList;
