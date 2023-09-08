import { Field, ID, ObjectType } from 'type-graphql';

export type FixDecorator<T> = T;

@ObjectType()
export class Item {
  @Field()
  itemId!: string;

  @Field()
  name!: string;

  @Field()
  modifiedAt!: Date;

  @Field()
  refinement!: string;

  @Field()
  cards!: string;

  @Field(type => [HistoryItemsObjectType])
  vendHist!: FixDecorator<HistoryItemsObjectType>[];

  @Field(type => [HistoryItemsObjectType])
  sellHist!: FixDecorator<HistoryItemsObjectType>[];

  /* Field Resolvers */

  @Field()
  iconURL!: string;

  @Field(() => ResolversPerDays)
  last30days!: FixDecorator<ResolversPerDays>;

  @Field(() => ResolversPerDays)
  last7days!: FixDecorator<ResolversPerDays>;

  @Field(() => ResolversPerDays)
  allTime!: FixDecorator<ResolversPerDays>;

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
export class HistoryItemsObjectType {
  @Field()
  date!: Date;

  @Field()
  price!: number;
}
