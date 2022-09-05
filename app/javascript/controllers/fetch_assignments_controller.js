import { Controller } from "@hotwired/stimulus"
import Swal from "sweetalert2"

// Connects to data-controller="fetch-assignments"
export default class extends Controller {
  static targets = ['form','teacher','data' ];

  new_assignment(e){
        e.preventDefault()
        //TODO:Dynamic Popup values wip
        // const school = this.schoolTarget.selectedOptions[0].textContent;
        const teachersAssigned = JSON.parse(this.dataTarget.dataset.teachersAssigned)
        const schoolsFilled = JSON.parse(this.dataTarget.dataset.schoolsFilled)
        const validatedAssign = JSON.parse(this.dataTarget.dataset.validatedAssign)

        const url = this.formTarget.action

        const isUnavailable = this.#isAssigned(this.teacherTarget.value, validatedAssign)

        if(isUnavailable.isAssigned){

        const school = this.#getSchool(schoolsFilled, isUnavailable.schoolID)
        const teacherSelected = this.teacherTarget.selectedOptions[0].textContent;

        Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: `
          ${teacherSelected} est déjà affecté\n
          à ${school.name}\n
          situé ${school.address}\n
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Je confirme',
          cancelButtonText: 'J\'annule',
          backdrop:true,
          reverseButtons: true,
          preConfirm: async () => {
              return await fetch(url, {
                method: "PATCH",
                headers: { "Accept": "application/json" },
                body:new FormData(this.formTarget)
              })
              .then(response =>{
                if(!response.ok) throw new Error(response.statusText)
                return response.json()
              })
             .catch(error => {
                Swal.showValidationMessage(
                  `Request failed: ${error}`
                )
              })
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {

          if(result.isConfirmed) {
            Swal.fire({
              title:'Modifier !',
              text:`
              ${result.value.name} se rendra à cette école ce jour\n
              ${result.value.email} | ${result.value.phone_number}
              `,
              icon: 'success'
            })
          } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
          ) {
            this.formTarget.reset()
            Swal.fire({
             title: 'Annulé',
             text: 'L\'affectation n\a pas était modifié.',
             icon: 'error',
            })
          }
        })
        } else {
            Swal.fire({
              title: 'Confirmation',
              text: `Modifier l'affectation ?`,
              icon: 'question',
              backdrop: true,
              showLoaderOnConfirm: true,
              showCancelButton:true,
              cancelButtonText:'Annuler',
              confirmButtonText: 'Valider',
              preConfirm: async () => {
                return await fetch(url, {
                  method: "PATCH",
                  headers: { "Accept": "application/json" },
                  body:new FormData(this.formTarget)
                })
                .then(response =>{
                  if(!response.ok) throw new Error(response.statusText)
                  return response.json()
                })
              .catch(error => {
                  Swal.showValidationMessage(
                    `Request failed: ${error}`
                  )
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
            }).then((result)=>{
              let content = ''

              if(result.value){
                content =`
                ${result.value.name} se rendra à cette école ce jour\n
                ${result.value.email} | ${result.value.phone_number}
                `
              }else{
                content ='Affectation annulé'
              }

              if(result.isConfirmed){
                Swal.fire({
                  title:'Modifier',
                  text: content,
                  icon:'success',
                  timer:3000
                })
              }else{
                this.formTarget.reset()
              }
            })
          }
    }

    #isAssigned(teacher, assignments){
      let result = {
        isAssigned : false,
        schoolID: null,
      }

      assignments.forEach((assignment)=>{
       if(assignment.teacher_id === parseInt(teacher))
          result.isAssigned = true
          result.schoolID = assignment.school_id
      })
      return result
    }

    #getSchool(schools, id){
      let result = {}
      schools.forEach((school)=>{
          if(school.id === id){
            result = school
          }
      })
      return result;
    }
}
