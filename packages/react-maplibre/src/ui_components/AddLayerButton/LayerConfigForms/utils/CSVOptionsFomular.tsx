import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { Button, List, ListItem, TextField, Typography } from '@mui/material';
import { useState } from 'react';

interface CSVOptionsFormulaProps {
	setter: any;
}

const optionFields = ['latfield', 'lonfield', 'delimiter'];

function CSVOptionsFormular(props: CSVOptionsFormulaProps) {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<Typography> Options </Typography>
			<Button onClick={() => setOpen(!open)}>
				{open ? <IndeterminateCheckBoxIcon /> : <AddBoxIcon />}
			</Button>

			<List>
				{open &&
					optionFields?.map((el) => {
						return (
							<>
								<ListItem>
									<Typography> {el} </Typography>
								</ListItem>
								<ListItem>
									<TextField
										size="small"
										onChange={(ev) => {
											const newObject = {};
											(newObject as { [key: string]: any })[el] = ev.target.value;
											props.setter(newObject);
										}}
									/>
								</ListItem>
							</>
						);
					})}
			</List>
		</>
	);
}

export default CSVOptionsFormular;
