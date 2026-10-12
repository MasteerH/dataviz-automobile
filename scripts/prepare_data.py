from pathlib import Path
import json
import pandas as pd


RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / "automobile" / "imports-85.data"
DESTINATION = RACINE / "rendu" / "data.js"


COLONNES = [
    "symboling",          # 1
    "normalized-losses",  # 2
    "make",               # 3
    "fuel-type",          # 4
    "aspiration",         # 5
    "num-of-doors",       # 6
    "body-style",         # 7
    "drive-wheels",       # 8
    "engine-location",    # 9
    "wheel-base",         # 10
    "length",             # 11
    "width",              # 12
    "height",             # 13
    "curb-weight",        # 14
    "engine-type",        # 15
    "num-of-cylinders",   # 16
    "engine-size",        # 17
    "fuel-system",        # 18
    "bore",               # 19
    "stroke",             # 20
    "compression-ratio",  # 21
    "horsepower",         # 22
    "peak-rpm",           # 23
    "city-mpg",           # 24
    "highway-mpg",        # 25
    "price",              # 26
]

CATEGORIELLES = ["make", "fuel-type", "body-style"]

NUMERIQUES = [
    "symboling",
    "wheel-base",
    "length",
    "width",
    "height",
    "curb-weight",
    "num-of-cylinders",
    "engine-size",
    "compression-ratio",
    "city-mpg",
    "highway-mpg",
    "price",
]

CYLINDRES = {
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "eight": 8,
    "twelve": 12,
}

NB_LIGNES_ATTENDU = 201
NB_COLONNES_ATTENDU = len(CATEGORIELLES) + len(NUMERIQUES)


def charger():
    df = pd.read_csv(SOURCE, header=None, names=COLONNES, na_values="?")
    print("Chargé :", df.shape)
    return df


def nettoyer(df):
    df = df[CATEGORIELLES + NUMERIQUES].copy()
    df = df.dropna()
    df["num-of-cylinders"] = df["num-of-cylinders"].map(CYLINDRES)

    for c in NUMERIQUES:
        df[c] = pd.to_numeric(df[c])
        # price est lu en décimal à cause des "?", on le remet en entier (13495 et pas 13495.0)
        if (df[c] % 1 == 0).all():
            df[c] = df[c].astype(int)

    df = df.reset_index(drop=True)
    print("Nettoyé :", df.shape)
    return df


def verifier(df):
    assert len(df) == NB_LIGNES_ATTENDU, "Il devrait y avoir 201 lignes"
    assert df.shape[1] == NB_COLONNES_ATTENDU, "Il devrait y avoir 15 colonnes"
    assert df.isna().sum().sum() == 0, "Il reste des valeurs manquantes"

    for c in NUMERIQUES:
        assert pd.api.types.is_numeric_dtype(df[c]), c + " n'est pas numérique"

    print("Première voiture :")
    print(df.iloc[0])


def ecrire_data_js(df):
    voitures = df.to_dict(orient="records")
    texte_json = json.dumps(voitures, indent=2, ensure_ascii=False)
    contenu = "const data=" + texte_json + ";"
    DESTINATION.write_text(contenu, encoding="utf-8")


if __name__ == "__main__":
    df = charger()
    df = nettoyer(df)
    verifier(df)
    ecrire_data_js(df)
    print("OK :", len(df), "voitures écrites dans", DESTINATION)