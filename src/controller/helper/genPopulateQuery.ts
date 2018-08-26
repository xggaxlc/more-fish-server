import { isArray } from 'lodash';
import { DocumentQuery, ModelPopulateOptions } from 'mongoose';

export const genPopulateQuery = (documentQuery: DocumentQuery<any, any>, populate: ModelPopulateOptions | Array<ModelPopulateOptions>) => {
  if (populate) {
    const populates = isArray(populate) ? populate : [populate];
    populates.forEach(item => {
      documentQuery = documentQuery.populate({ ...item });
    });
  }
  return documentQuery;
}
