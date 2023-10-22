import { Inject, Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { HttpAdapter } from 'src/common/interfaces/http-interface.interface';

@Injectable()
export class SeedService {

  constructor(
    @Inject('HttpAdapter') private readonly httpAdapter: HttpAdapter,
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>) { }

  async load() {

    await this.pokemonModel.deleteMany({});

    const data = await this.httpAdapter.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const createPokemonDtos: CreatePokemonDto[] = data.results.map(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      return { no, name };
    });

    await this.pokemonModel.insertMany(createPokemonDtos);
    return 'Seed Executed';
  }

}
