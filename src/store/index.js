import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'
import system from './modules/system'

Vue.use(Vuex)

const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: window.localStorage
})

export default new Vuex.Store({
  modules: {
    system
  },
  state: {
    currentCollectiveID: null,
    currentCouncilID: null,
    currentProposalID: null,
    currentActionGroup: []
  },
  getters: {
    currentCollective: state => {
      return state.system.collectives.find(c => c.id === state.currentCollectiveID)
    },
    currentCouncil: state => {
      return state.system.councils.find(c => c.id === state.currentCouncilID)
    },
    currentProposal: state => {
      return state.system.proposals.find(p => p.id === state.currentProposalID)
    },
    collectiveCouncils: state => {
      return state.system.councils.filter(function(c) {
        return c.collectiveID === state.currentCollectiveID && !c.collectiveCouncil
      })
    },
    collectiveMembers: state => {
      return state.system.members.filter(function(m) {
        return m.collectiveID === state.currentCollectiveID
      })
    },
    councilProposals: state => {
      return state.system.proposals.filter(p => p.councilID === state.currentCouncilID)
    },
    collectiveProposals: state => {
      return state.system.proposals.filter(p => p.collectiveID === state.currentCollectiveID)
    },
    councilById: (state) => (id) => {
      return state.system.councils.find(c => c.id === id)
    }
  },
  mutations: {
    submitCollective (state, payload) {
      if (!payload.collectiveID) {
        this.commit('system/createCollective', {
          name: payload.collectiveName,
          description: payload.collectiveDescription,
          details: payload.collectiveDetails
        })
        this.commit('setCollective', state.system.lastCollectiveID)
        this.commit('setCouncil', state.system.lastCouncilID)
      } else {
        this.commit('system/updateCollective', {
          collectiveID: payload.collectiveID,
          name: payload.collectiveName,
          details: payload.collectiveDetails,
          description: payload.collectiveDescription
        })
      }
    },
    submitCouncil(state, payload) {
      if (!payload.councilID) {
        this.commit('system/createCouncil', {
          name: payload.councilName,
          parentCouncilID: payload.parentCouncilID,
          collectiveID: payload.collectiveID
        })
        this.commit('setCouncil', state.system.lastCouncilID)
      } else {
        this.commit('system/updateCouncil', {
          councilID: payload.councilID,
          name: payload.councilName
        })
      }
    },
    submitProposal(state, payload) {
      if (!payload.proposalID) {
        this.commit('system/createProposal', {
          name: payload.proposalName,
          councilID: payload.councilID,
          collectiveID: payload.collectiveID
        })
      } else {
        this.commit('system/iterateProposal', {
          proposalID: payload.proposalID,
          name: payload.proposalName
        })
      }
      this.commit('setProposal', payload.proposalID || state.system.lastProposalID)
    },
    submitMember(state, payload) {
      if (!payload.memberID) {
        this.commit('system/createMember', {
          name: payload.memberName,
          collectiveID: state.currentCollectiveID
        })
      } else {
        this.commit('system/updateMember', {
          name: payload.memberName,
          id: payload.memberID
        })
      }
    },
    unsetCollective (state) {
      state.currentCollectiveID = null
      state.currentCouncilID = null
      state.currentProposalID = null
    },
    setCollective(state, id) {
      state.currentCollectiveID = id
      this.commit('setCollectiveCouncil')
    },
    setCouncil(state, id) {
      state.currentCouncilID = id
      state.currentProposalID = null
    },
    setCollectiveCouncil(state) {
      this.commit('setCouncil', state.system.councils.find(function(c) {
        return c.collectiveID === state.currentCollectiveID && c.collectiveCouncil === true
      }).id)
    },
    unsetProposal (state) {
      state.currentProposalID = null
    },
    setProposal (state, id) {
      state.currentProposalID = id
    },
    addGroupAction (state) {
      state.currentActionGroup.push({ paramsInput: {}, selectedType: null })
    },
    clearActions (state) {
      state.currentActionGroup = []
    }
  },
  plugins: [vuexLocalStorage.plugin]
})
