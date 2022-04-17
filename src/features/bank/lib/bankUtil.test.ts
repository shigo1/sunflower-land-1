import Decimal from 'decimal.js-light'
import { INITIAL_FARM } from 'features/game/lib/constants'
import { canWithdraw } from './bankUtils'

describe('canWithdraw', () => {
    it('prevents users from withdrawing seeds', () => {
        const enabled = canWithdraw({
            item: 'Sunflower Seed',
            game: INITIAL_FARM
        })

        expect(enabled).toBeFalsy()
    })

    it('enables users to withdraw crops', () => {
        const enabled = canWithdraw({
            item: 'Sunflower',
            game: {
                ...INITIAL_FARM,
                inventory: {
                    Sunflower: new Decimal(1)
                }
            }
        })

        expect(enabled).toBeTruthy()
    })

    it('prevents users from withdrawing skills', () => {
        const enabled = canWithdraw({
            item: 'Green Thumb',
            game: INITIAL_FARM
        })

        expect(enabled).toBeFalsy()
    })

    it('prevents users from withdrawing food items', () => {
        const enabled = canWithdraw({
            item: 'Pumpkin Soup',
            game: INITIAL_FARM
        })

        expect(enabled).toBeFalsy()
    })

    it('enables a user to withdraw a golden cauliflower when not in use', () => {
        const enabled = canWithdraw({
            item: 'Golden Cauliflower',
            game: {
                ...INITIAL_FARM,
                fields: {},
            }
        })

        expect(enabled).toBeTruthy()
    })

    it('prevents a user withdrawing a golden cauliflower when in use', () => {
        const enabled = canWithdraw({
            item: 'Golden Cauliflower',
            game: {
                ...INITIAL_FARM,
                fields: {
                    0: {
                        name: 'Cauliflower',
                        plantedAt: Date.now()
                    }
                }
            }
        })

        expect(enabled).toBeFalsy()
    })

    it('enables a user to withdraw a mysterious parsnip when not in use', () => {
        const enabled = canWithdraw({
            item: 'Mysterious Parsnip',
            game: {
                ...INITIAL_FARM,
                fields: {},
            }
        })

        expect(enabled).toBeTruthy()
    })

    it('prevents user from withdrawing a parsnip in use', () => {
        const enabled = canWithdraw({
            item: 'Mysterious Parsnip',
            game: {
                ...INITIAL_FARM,
                fields: {
                    0: {
                        name: 'Parsnip',
                        plantedAt: Date.now()
                    }
                }
            }
        })

        expect(enabled).toBeFalsy()
    })

    it('enables a user to withdraw a scarecrow when not in use', () => {
        const enabled = canWithdraw({
            item: 'Nancy',
            game: {
                ...INITIAL_FARM,
                fields: {},
            }
        })

        expect(enabled).toBeTruthy()
    })

    it('prevents a user to withdraw a scarecrow when in use', () => {
        const enabled = canWithdraw({
            item: 'Nancy',
            game: INITIAL_FARM,
        })

        expect(enabled).toBeFalsy()
    })

    it('enables a user to withdraw a beaver when not in use', () => {
        const enabled = canWithdraw({
            item: 'Woody the Beaver',
            game: {
                ...INITIAL_FARM,
                trees: {
                    0: {
                        // ready to be chopped
                        choppedAt: 0,
                        wood: new Decimal(3)
                    }
                }
            }
        })

        expect(enabled).toBeTruthy()
    })

    it('prevent a user to withdraw a beaver when in use', () => {
        const enabled = canWithdraw({
            item: 'Woody the Beaver',
            game: {
                ...INITIAL_FARM,
                trees: {
                    0: {
                        // Just been chopped
                        choppedAt: Date.now(),
                        wood: new Decimal(3)
                    }
                }
            }
        })

        expect(enabled).toBeFalsy()
    })

    it('prevent a user to withdraw kuebiko while they have seeds', () => {
        const enabled = canWithdraw({
            item: 'Kuebiko',
            game: {
                ...INITIAL_FARM,
                fields: {},
                inventory: {
                    "Sunflower Seed": new Decimal(1)
                }
            }
        })

        expect(enabled).toBeFalsy()
    })

    it('enable a user to withdraw kuebiko while they dont have seeds', () => {
        const enabled = canWithdraw({
            item: 'Kuebiko',
            game: {
                ...INITIAL_FARM,
                fields: {},
                inventory: {}
            }
        })

        expect(enabled).toBeTruthy()
    })
})