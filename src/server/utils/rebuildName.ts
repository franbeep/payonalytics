// name from ragnApi comes in snake case lowercase
import { capitalize } from 'lodash';

export default (rawName: string) => {
  return capitalize(rawName.replace('_', ' '));
};
