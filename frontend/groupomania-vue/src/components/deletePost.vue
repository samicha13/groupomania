<template>
<i @click.prevent="deletePost" class="fa fa-trash" ></i>
</template>


<script>
import instance from "@/Api.js";

export default {
  name: "deletePost",
  props: {
    id: Number,
  },
  data() {
    return {
      token: "",
    };
  },
  methods: {
    deletePost: function() {

      const self = this;
      var userselection = confirm("Supprimez ce post ?");
      if (userselection === true)
      {

       const id = this.id
        instance
          .delete('/posts',{data:{id}})
            .then(function () {

              self.$store.dispatch("loadPosts");
            })
            .catch((error) => {console.error(error.response.data)});
      }
    }
  },
};
</script>

<style scoped>
.fa-trash 
{
   color: rgb(240, 54, 54) !important;
  font-size: 20px;
  cursor: pointer;
}
</style>