class TattooArtist {
  constructor({ id, uid, title, phone, city, description, instagram_link, facebook_link, created_at, updated_at }) {
    this.id = id; // UUID de la table tattoo_artists
    this.uid = uid; // Firebase UID (jointure depuis la table users)
    this.title = title;
    this.phone = phone;
    this.city = city;
    this.description = description;
    this.instagram_link = instagram_link;
    this.facebook_link = facebook_link;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  // Méthode métier possible : mise à jour interne des champs
  update(data) {
    if (data.title) this.title = data.title;
    if (data.phone) this.phone = data.phone;
    if (data.city) this.city = data.city;
    if (data.description) this.description = data.description;
    if (data.instagram_link) this.instagram_link = data.instagram_link;
    if (data.facebook_link) this.facebook_link = data.facebook_link;
    this.updatedAt = new Date();
  }
}

module.exports = TattooArtist;
