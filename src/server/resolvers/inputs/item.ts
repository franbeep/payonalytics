import { Field, ID, ObjectType } from 'type-graphql';

export type FixDecorator<T> = T;

@ObjectType()
export class Item {
  @Field(type => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  modifiedAt!: Date;

  @Field(() => RawMongoData)
  rawData!: FixDecorator<RawMongoData>;

  @Field()
  iconURL!: string;
}

@ObjectType()
export class Sevira {
  @Field()
  id!: string;
}

@ObjectType()
export class RawMongoData {
  @Field()
  itemName!: string;

  @Field()
  modifiedAt!: Date;

  @Field(type => [HistoryItemsObjectType])
  vendHist!: FixDecorator<HistoryItemsObjectType>[];

  @Field(type => [HistoryItemsObjectType])
  sellHist!: FixDecorator<HistoryItemsObjectType>[];
}

@ObjectType()
export class HistoryItemsObjectType {
  @Field()
  x!: string;

  @Field(type => [Number])
  y!: number[];

  @Field(type => [FilterItemObjectType])
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
