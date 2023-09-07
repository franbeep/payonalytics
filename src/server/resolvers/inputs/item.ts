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

  // @Field(() => RawMongoData)
  // rawData!: FixDecorator<RawMongoData>;

  /* Field Resolvers */

  @Field()
  iconURL!: string;

  @Field()
  refinament!: number;

  @Field()
  cards!: string;

  @Field(() => ResolversPerDays)
  last30days!: FixDecorator<ResolversPerDays>;

  @Field(() => ResolversPerDays)
  last7days!: FixDecorator<ResolversPerDays>;

  // misc

  @Field()
  mppi!: string;
}

@ObjectType()
export class ResolversPerDays {
  @Field()
  hps!: string;

  @Field()
  lps!: string;

  @Field()
  avgl!: string;

  @Field()
  avgs!: string;

  @Field()
  qtys!: string;

  @Field()
  qtyl!: string;
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
