'use strict';

var app = angular.module('pokedex', []);

app.constant('api', {
    baseGet    : 'http://pokeapi.co',
    getAll     : '/api/v1/pokemon/?limit=12',
    getOne     : '/api/v1/pokemon/',
    baseAvatar : 'http://pokeapi.co/media/img/',
    typeAvatar : '.png'
});
app.factory('PokedexFactory', ['$http', 'api', pokedexFactory]);
app.controller('MainCtrl', ['PokedexFactory', 'api', mainCtrl]);


function mainCtrl(PokedoxFactory, api) {
    var vm = this;

    vm.title = 'Pokedex';
    vm.count = 0;
    vm.pokemon      = {};
    vm.pokemonsList = [];
    vm.nextUrl      = '';
    vm.getPokemons  = getPokemons;
    vm.loadMore     = getPokemons;
    vm.getPokemon   = getPokemon;
    vm.closeInfo    = closeInfo;

    activate();

    function activate() {
        vm.getPokemons();
    }

    function getPokemons() {
        PokedoxFactory.getPokemons(vm.nextUrl)
            .then(success)
            .catch(fail);

        function success(response) {
            var data     = response.data;
            var pokemons = getPokemonsApiResponsFormater(data.objects);

            vm.pokemonsList = (vm.pokemonsList.length)
                ? vm.pokemonsList.concat(pokemons)
                : pokemons;
            vm.nextUrl      = data.meta.next;
            vm.count        = vm.pokemonsList.length;
        }

        function fail(error) {
            console.error(error.message);
        }

        function getPokemonsApiResponsFormater(pokemons) {
            return pokemons.map(function(pokemon) {
                return  {
                    id     : pokemon.pkdx_id,
                    name   : pokemon.name,
                    avatar : api.baseAvatar + pokemon.pkdx_id + api.typeAvatar,
                    types  : pokemon.types
                };
            });
        }
    }

    function getPokemon(pokemonId) {
        PokedoxFactory.getPokemon(pokemonId)
            .then(success)
            .catch(fail);

        function success(response) {
            var data     = response.data;
            var pokemon  = getPokemonApiResponsFormater(data);

            vm.pokemon = pokemon;
        }

        function fail(error) {
            console.error(error.message);
        }

        function getPokemonApiResponsFormater(pokemon) {
            return {
                id         : pokemon.pkdx_id,
                name       : pokemon.name,
                avatar     : api.baseAvatar + pokemon.pkdx_id + api.typeAvatar,
                attack     : pokemon.attack,
                defense    : pokemon.defense,
                hp         : pokemon.hp,
                spAtk      : pokemon.sp_atk,
                spDef      : pokemon.sp_def,
                speed      : pokemon.speed,
                weight     : pokemon.weight,
                totalMoves : pokemon.moves.length
            };
        }
        
        function saveToOriginal(pokemon) {
            vm.pokemonsList[pokemon.id]._description = pokemon;
        }
    }

    function closeInfo() {
        vm.pokemon = null;
    }
}

function pokedexFactory($http, api) {
    return {
        getPokemons : getPokemons,
        getPokemon  : getPokemon
    };

    function getPokemons(nextUrl) {
        if (!nextUrl) { nextUrl = api.getAll; }

        return $http.get(api.baseGet + nextUrl);
    }

    function getPokemon(pokemonId) {
        return $http.get(api.baseGet + api.getOne + pokemonId);
    }
}