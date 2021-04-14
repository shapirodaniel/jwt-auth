import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

// can provide an explicit table name

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
	// expose fields with @Field
	// typeORM can't infer type of number since int / float etc.
	// so we have to specify with anon fn
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	// inferred type but can be specified as well
	@Field()
	@Column('text')
	email: string;

	@Column()
	password: string;

	// whenever we create a refresh token
	// we'll pass the current token version
	// allows us to revoke / invalidate any tokens
	// whose version doesn't match current
	@Column('int', { default: 0 })
	tokenVersion: number;
}
