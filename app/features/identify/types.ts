export type IdentificationResult = {
  id: number;
  custom_id: string;
  meta_data: {
    latitude: string;
    longitude: string;
    datetime: string;
  };
  uploaded_datetime: number;
  finished_datetime: number;
  images: [
    {
      file_name: string;
      url: string;
    }
  ];
  suggestions: [
    {
      id: number;
      plant_name: string;
      plant_details: {
        scientific_name: string;
        structured_name: {
          genus: string;
          species: string;
        };
        common_names: string[];
        url: string;
        name_authority: string;
        wiki_description: {
          value: string;
          citation: string;
          license_name: string;
          license_url: string;
        };
        taxonomy: {
          kingdom: string;
          phylum: string;
          class: string;
          order: string;
          family: string;
          genus: string;
        };
        synonyms: string[];
      };
      probability: number;
      confirmed: false;
      similar_images: [
        {
          id: string;
          similarity: number;
          url: string;
          url_small: string;
        }
      ];
    }
  ];
  modifiers: string[];
  secret: string;
  fail_cause: string;
  countable: true;
};
