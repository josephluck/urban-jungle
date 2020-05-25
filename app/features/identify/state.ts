import { IdentificationResult } from "./types";

export const exampleIdentificationResponse: IdentificationResult = {
  countable: true,
  custom_id: null,
  fail_cause: null,
  feedback: null,
  finished_datetime: 1590397233.560439,
  id: 2444441,
  images: [
    {
      file_name: "a26098ac38664b3186d7dbf806395224.jpg",
      url: "https://plant.id/media/images/a26098ac38664b3186d7dbf806395224.jpg",
    },
  ],
  meta_data: {
    datetime: "2020-05-25",
    latitude: null,
    longitude: null,
  },
  modifiers: ["crops_fast", "similar_images"],
  secret: "Es41HMjPKsecRYX",
  suggestions: [
    {
      confirmed: false,
      id: 17156394,
      plant_details: {
        common_names: [
          "Snake plant",
          "Dracaena trifasciata",
          "Saint george's sword",
          "Mother-in-law's tongue",
          "Viper's bowstring hemp",
        ],
        name_authority: "Sansevieria trifasciata Prain",
        scientific_name: "Sansevieria trifasciata",
        structured_name: {
          genus: "sansevieria",
          species: "trifasciata",
        },
        synonyms: [
          "Aletris hyacinthoides var. zeylanica",
          "Aletris zeylanica",
          "Aloe hyacinthoides var. zeylanica",
          "Aloe zeylanica",
          "Sansevieria zeylanica",
        ],
        taxonomy: {
          class: "Liliopsida",
          family: "Asparagaceae",
          genus: "Sansevieria",
          kingdom: "Plantae",
          order: "Asparagales",
          phylum: "Tracheophyta",
        },
        url: "http://en.wikipedia.org/wiki/Sansevieria_trifasciata",
        wiki_description: {
          citation: "http://en.wikipedia.org/wiki/Sansevieria_trifasciata",
          license_name: "CC BY-SA 3.0",
          license_url: "https://creativecommons.org/licenses/by-sa/3.0/",
          value:
            "Dracaena trifasciata is a species of flowering plant in the family Asparagaceae, native to tropical West Africa from Nigeria east to the Congo. It is most commonly known as the snake plant, Saint George's sword, mother-in-law's tongue, and viper's bowstring hemp, among other names. Until 2017, it was known under the synonym Sansevieria trifasciata.",
        },
      },
      plant_name: "Sansevieria trifasciata",
      probability: 0.8905296826857916,
      similar_images: [
        {
          id: "e41eaa2fdaefabc9dab4058d16693923",
          similarity: 0.9622819318863893,
          url:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria trifasciata/e41eaa2fdaefabc9dab4058d16693923.jpg",
          url_small:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria trifasciata/e41eaa2fdaefabc9dab4058d16693923.small.jpg",
        },
        {
          id: "3710b096600461a73b6f921e4d3c2cc1",
          similarity: 0.9531320888114376,
          url:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria trifasciata/3710b096600461a73b6f921e4d3c2cc1.jpg",
          url_small:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria trifasciata/3710b096600461a73b6f921e4d3c2cc1.small.jpg",
        },
      ],
    },
    {
      confirmed: false,
      id: 17156395,
      plant_details: {
        common_names: [
          "Dracaena",
          "Mother-in-law's tongue, devil's tongue, jinn's tongue, bow string hemp, snake plant",
          "Snake tongue",
        ],
        name_authority: null,
        scientific_name: "Sansevieria",
        structured_name: {
          genus: "sansevieria",
        },
        synonyms: [],
        taxonomy: {
          class: "Liliopsida",
          family: "Asparagaceae",
          genus: "Sansevieria",
          kingdom: "Plantae",
          order: "Asparagales",
          phylum: "Tracheophyta",
        },
        url: "http://en.wikipedia.org/wiki/Sansevieria",
        wiki_description: {
          citation: "http://en.wikipedia.org/wiki/Sansevieria",
          license_name: "CC BY-SA 3.0",
          license_url: "https://creativecommons.org/licenses/by-sa/3.0/",
          value:
            "Sansevieria is a historically recognized genus of flowering plants, native to Africa, Madagascar and southern Asia, now included in the genus Dracaena on the basis of molecular phylogenetic studies. Common names for the 70 or so species formerly placed in the genus include mother-in-law's tongue, devil's tongue, jinn's tongue, bow string hemp, snake plant and snake tongue. In the APG III classification system, Dracaena is placed in the family Asparagaceae, subfamily Nolinoideae (formerly the family Ruscaceae). It has also been placed in the former family Dracaenaceae.",
        },
      },
      plant_name: "Sansevieria",
      probability: 0.040397136810444274,
      similar_images: [
        {
          id: "4ead6926846a67cdd62b44ca7df1fdc1",
          similarity: 0.8095614272884976,
          url:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria/4ead6926846a67cdd62b44ca7df1fdc1.jpg",
          url_small:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria/4ead6926846a67cdd62b44ca7df1fdc1.small.jpg",
        },
        {
          id: "9cd42969d07d8fe264834f54bc67bc18",
          similarity: 0.7855987380644454,
          url:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria/9cd42969d07d8fe264834f54bc67bc18.jpg",
          url_small:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria/9cd42969d07d8fe264834f54bc67bc18.small.jpg",
        },
      ],
    },
    {
      confirmed: false,
      id: 17156396,
      plant_details: {
        common_names: [
          "Cylindrical snake plant",
          "African spear",
          "Spear sansevieria",
          "Saint bárbara sword",
        ],
        name_authority: "Sansevieria cylindrica Bojer ex Hook.",
        scientific_name: "Sansevieria cylindrica",
        structured_name: {
          genus: "sansevieria",
          species: "cylindrica",
        },
        synonyms: [],
        taxonomy: {
          class: "Liliopsida",
          family: "Asparagaceae",
          genus: "Sansevieria",
          kingdom: "Plantae",
          order: "Asparagales",
          phylum: "Tracheophyta",
        },
        url: "http://en.wikipedia.org/wiki/Sansevieria_cylindrica",
        wiki_description: {
          citation: "http://en.wikipedia.org/wiki/Sansevieria_cylindrica",
          license_name: "CC BY-SA 3.0",
          license_url: "https://creativecommons.org/licenses/by-sa/3.0/",
          value:
            "Sansevieria cylindrica, also known as the cylindrical snake plant, African spear or spear sansevieria or in Brazil Saint Bárbara Sword,  is a succulent plant native to Angola.",
        },
      },
      plant_name: "Sansevieria cylindrica",
      probability: 0.013592351825478126,
      similar_images: [
        {
          id: "2190fc33e60af0a2edd8306c38c6aac9",
          similarity: 0.8148923704623681,
          url:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria cylindrica/2190fc33e60af0a2edd8306c38c6aac9.jpg",
          url_small:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria cylindrica/2190fc33e60af0a2edd8306c38c6aac9.small.jpg",
        },
        {
          id: "56b1ad48f41320f9e2a4aa754e15aad9",
          similarity: 0.7607781972849298,
          url:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria cylindrica/56b1ad48f41320f9e2a4aa754e15aad9.jpg",
          url_small:
            "https://storage.googleapis.com/plant_id_images/similar_images/2019_05/images/Sansevieria cylindrica/56b1ad48f41320f9e2a4aa754e15aad9.small.jpg",
        },
      ],
    },
  ],
};
