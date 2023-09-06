import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class Item {
  @Field(type => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  iconURL!: string;

  @Field()
  modifiedAt!: Date;

  @Field()
  rawData!: RawMongoData;
}

@ObjectType()
export class RawMongoData {
  @Field()
  itemName!: string;

  @Field()
  iconURL!: string;

  @Field()
  modifiedAt!: Date;

  @Field()
  vendHist!: HistoryItemsObjectType[];

  @Field()
  sellHist!: HistoryItemsObjectType[];
}

@ObjectType()
export class HistoryItemsObjectType {
  @Field()
  x!: string;

  @Field()
  y!: Array<number>;

  @Field()
  filter!: FilterItemObjectType[];
}

@ObjectType()
export class FilterItemObjectType {
  @Field()
  r!: number;

  @Field()
  c0!: number;

  @Field()
  c1!: number;

  @Field()
  c2!: number;

  @Field()
  c3!: number;
}
