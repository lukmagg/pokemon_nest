import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; 
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';


@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  // las inserciones a base de datos son asincronas
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch(error){
      this.handleExceptions(error)
    } 
  } 

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    let pokemon: Pokemon;

    // no
    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no:term})
    }

    // MongoID
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    // Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()})
    }

    if(!pokemon)
      throw new NotFoundException(`Pokemon with id, name or no ${term} not found`)

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
   
    // Busca en la base de datos el pokemon segun el term
    const pokemon = await this.findOne(term); 

    // Si existe updatePokemonDto.name en el dto del body
    //  lo pone con minusculas
    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try{
      // Actualiza el pokemon la base de datos
      await pokemon.updateOne(updatePokemonDto);
      // Devuelve el pokemon actualizado
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error){
      this.handleExceptions(error)
    }

  }

  async remove(id: string) {
    /* const pokemon = await this.findOne(id);
    await pokemon.deleteOne(); */
    
    //const result = await this.pokemonModel.findByIdAndDelete(id);

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id})

    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon with id ${id} not found`)
    }
    return;
  }


  private handleExceptions(error: any){
    if(error.code === 11000)
        throw new BadRequestException(`Pokemon exist in db ${JSON.stringify(error.keyValue)}`)
    console.log(error)
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
  }

}
