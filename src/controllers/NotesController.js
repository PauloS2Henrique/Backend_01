const knex = require("../database/knex");
 
class NotesController{
  async create(request, response){
    const { title, description, movie_points, tags} = request.body;
    const { user_id } = request.params;

    const [note_id] = await knex("film_notes").insert({
      title,
      description,
      movie_points,
      user_id,
    })

    const tagsInsert = tags.map(name => {
      return{
        note_id,
        name,
        user_id
      }
    });
    
    await knex("tags").insert(tagsInsert)
    
   response.json();
  }

  async show(request, response){
    const { id } = request.params;

    const note = await knex("film_notes").where({ id }).first()
    const tags = await knex("tags").where({note_id: id}).orderBy("name");

    return response.json({
      ...note,
      tags
    });
  }

  async delete(request, response){
    const {id} = request.params;

    await knex("film_notes").where({ id }).delete();

    return response.json();
  }

  async index(request, response){
    const {title, user_id, tags } = request.query;

    let film_notes;

    if(tags){
      const filterTags = tags.split(',').map(tag => tag.trim());
      
      film_notes = await knex("tags")
      .select([
        "film_notes.id",
        "film_notes.title",
        "film_notes.user_id",
      ])
      .where("film_notes.user_id", user_id)
      .whereLike("film_notes.title", `%${title}%`)
      .whereIn("name", filterTags)
      .innerJoin("film_notes", "notes.id", "tags.note_id")
      .orderBy("film_notes.title")

    }else{
      film_notes = await knex("film_notes")
    .where({  user_id })
    .whereLike("title", `%${title}%`)
    .orderBy("title");
    }

    const userTags = await knex('tags').where({ user_id });
    const noteswithTags = film_notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags
      }
    })

    return response.json(noteswithTags);
  }
}

module.exports = NotesController;