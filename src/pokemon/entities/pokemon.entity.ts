import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class Pokemon extends Document {

    // id: string (Este id me lo da mongo por eso no hay que especificarlo)


    @Prop({
        unique: true,
        index: true
    })
    name: string;

    @Prop({
        unique: true,
        index: true
    })
    no: number;    // numero de pokemon

}


export const PokemonSchema = SchemaFactory.createForClass( Pokemon );