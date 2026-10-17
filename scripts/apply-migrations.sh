#!/data/data/com.termux/files/usr/bin/bash
# =========================================================
# Chez Tantie V2 — Applique les migrations SQL via
# la Management API Supabase.
# =========================================================
set -euo pipefail

cd "$(dirname "$0")/.."

# --- Dossier temporaire portable (Termux n'a pas /tmp) ---
TMP="${TMPDIR:-${PREFIX:-/data/data/com.termux/files/usr}/tmp}"
mkdir -p "$TMP"
PAYLOAD="$TMP/ct_payload.json"
RESPONSE="$TMP/ct_response.txt"

# --- Vérifications ---
if [ ! -f scripts/.token ]; then
  echo "❌ scripts/.token manquant"
  exit 1
fi

if [ ! -f .env ]; then
  echo "❌ .env manquant"
  exit 1
fi

PAT=$(tr -d '[:space:]' < scripts/.token)
SUPABASE_URL=$(grep '^SUPABASE_URL=' .env | cut -d= -f2- | tr -d '[:space:]' || true)
REF=$(echo "$SUPABASE_URL" | sed 's|https://||; s|\.supabase\.co.*||')

if [ -z "$PAT" ]; then
  echo "❌ PAT vide"
  exit 1
fi

if [ -z "$REF" ]; then
  echo "❌ Impossible de lire SUPABASE_URL dans .env"
  exit 1
fi

echo "🔗 Projet Supabase : $REF"
echo "📁 TMP utilisé   : $TMP"
echo

# --- Boucle sur les migrations ---
for f in supabase/migrations/*.sql; do
  nom=$(basename "$f")
  echo "▶ $nom"

  python3 -c "
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as fh:
    print(json.dumps({'query': fh.read()}))
" "$f" > "$PAYLOAD"

  HTTP_CODE=$(curl -sS -o "$RESPONSE" -w "%{http_code}" \
    -X POST "https://api.supabase.com/v1/projects/${REF}/database/query" \
    -H "Authorization: Bearer ${PAT}" \
    -H "Content-Type: application/json" \
    --data-binary @"$PAYLOAD")

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "  ✅ OK"
  else
    echo "  ❌ Échec (HTTP $HTTP_CODE)"
    echo "  Réponse :"
    cat "$RESPONSE"
    echo
    rm -f "$PAYLOAD" "$RESPONSE"
    exit 1
  fi
done

rm -f "$PAYLOAD" "$RESPONSE"
echo
echo "✅ Toutes les migrations ont été appliquées."
