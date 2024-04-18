export interface ResultsType {
  npm: string;
  author: string;
  jenjang: string;
  jenis: string;
  kodeProdi: string;
  prodi: string;
  fakultas: string;
  status: string;
  tahun: number;
}

export interface BatchResultsType {
  jenjang: string;
  fakultas: string;
  total: number;
  page: string;
  limit: string;
  results: Array<ResultsType>;
}

export default async function fetchData(
  url: string,
  prodi: string,
  page: string,
  limit: string,
) {
  const params = {
    page,
    limit,
  };
  const getBatchData = await fetch(
    url + prodi + "?" + new URLSearchParams(params),
  );
  const dataResults: BatchResultsType = await getBatchData.json();
  return dataResults;
}
