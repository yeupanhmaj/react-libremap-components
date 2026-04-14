import { PdfContextProvider } from './lib/PdfContext';
import PdfForm, { type PdfFormProps } from './lib/PdfForm';

/**
 * Create PDF Form Component
 *
 */
const MlCreatePdfForm = (props: PdfFormProps) => {
	return (
		<>
			<PdfContextProvider>
				<PdfForm {...props} />
			</PdfContextProvider>
		</>
	);
};

export default MlCreatePdfForm;
