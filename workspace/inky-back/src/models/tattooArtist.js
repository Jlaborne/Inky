class TattooArtist {
  constructor(uid, userUid, title, phone, email, description, city, instagram_link, facebook_link, createdAt, updatedAt) {
    this.uid = uid;
    this.userUid = userUid;
    this.title = title;
    this.phone = phone;
    this.email = email;
    this.description = description;
    this.city = city;
    this.instagram_link = instagram_link;
    this.facebook_link = facebook_link;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Method to update artist's information
  updateArtist({ title, phone, email, description, city, instagram_link, facebook_link }) {
    if (title) this.title = title;
    if (phone) this.phone = phone;
    if (email) this.email = email;
    if (description) this.description = description;
    if (city) this.city = city;
    if (instagram_link) this.instagram_link = instagram_link;
    if (facebook_link) this.facebook_link = facebook_link;
    this.updatedAt = new Date();
  }
}

module.exports = TattooArtist;
