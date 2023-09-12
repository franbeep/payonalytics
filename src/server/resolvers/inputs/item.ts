import { Field, ID, ObjectType } from 'type-graphql';

export type FixDecorator<T> = T;

@ObjectType()
export class ItemHistory {
  @Field()
  itemId!: number;

  @Field()
  name!: string;

  @Field()
  refinement!: number;

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
}

@ObjectType()
export class ResolversPerDays {
  @Field()
  hps!: number;

  @Field()
  lps!: number;

  @Field()
  avgl!: number;

  @Field()
  avgs!: number;

  @Field()
  qtys!: number;

  @Field()
  qtyl!: number;
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
  itemId!: number;

  @Field()
  refinement!: number;

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
  lp!: number;

  @Field()
  hp!: number;

  @Field()
  qty!: number;

  @Field(returns => LocationObject)
  minLocation!: FixDecorator<LocationObject>;
}

@ObjectType()
export class LocationObject {
  @Field()
  location!: string;

  @Field()
  price!: number;
}

@ObjectType()
export class VendingDataObject {
  @Field()
  listedDate!: Date;

  @Field()
  shopName!: string;

  @Field()
  amount!: number;

  @Field()
  price!: number;

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
