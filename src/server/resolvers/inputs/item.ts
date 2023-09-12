import { Field, ID, ObjectType } from 'type-graphql';

export type FixDecorator<T> = T;

@ObjectType()
export class ItemHistory {
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

@ObjectType()
export class ItemVending {
  @Field()
  itemId!: string;

  @Field()
  refinement!: string;

  @Field()
  cards!: string;

  @Field(() => [VendingDataObject])
  vendingData!: FixDecorator<VendingDataObject>[];

  /* field resolvers */

  @Field()
  iconURL!: string;

  @Field()
  name!: string;

  @Field()
  lp!: string;

  @Field()
  hp!: string;

  @Field()
  qty!: string;

  @Field(returns => LocationObject)
  minLocation!: FixDecorator<LocationObject>;
}

@ObjectType()
export class LocationObject {
  @Field()
  location!: string;

  @Field()
  price!: string;
}

@ObjectType()
export class VendingDataObject {
  @Field()
  listedDate!: string;

  @Field()
  shopName!: string;

  @Field()
  amount!: string;

  @Field()
  price!: string;

  @Field(returns => CoordinatesObject)
  coordinates!: FixDecorator<CoordinatesObject>;
}

@ObjectType()
export class CoordinatesObject {
  @Field()
  map!: string;

  @Field()
  x!: number;

  @Field()
  y!: number;
}
