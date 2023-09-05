import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class Item {
  @Field((type) => ID)
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  shouldIByIt!: boolean;

  @Field()
  modifiedAt!: Date;
}
