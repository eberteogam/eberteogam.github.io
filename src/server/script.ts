import { gs, type GlideRecord } from '@servicenow/glide'
import snakeCase from 'lodash.snakecase'

export function showStateUpdate(current: GlideRecord, previous: GlideRecord) {
    const currentState = current.getValue('state')
    const previousState = previous.getValue('state')

    // gs.addInfoMessage(`state updated from "${previousState}" to "${currentState}"`)
    // state updated from "2" to "3"
    gs.addInfoMessage(snakeCase('state updated from "${previousState}" to "${currentState}"'))
    // state_updated_from_previous_state_to_current_state
}