'use strict';

const
    modelName = 'Credit';

module.exports = (/**Sequelize*/sequelize, DataTypes)=> {

    return [

        /**@typedef {{}} Bank*/
        sequelize.define(modelName, {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },client_id: {
                field: 'client_id',
                type: DataTypes.UUID,
                allowNull: false,
                unique: true
            },
            sum: {
                field: 'sum',
                type: DataTypes.UUID,
                allowNull: false,
                unique: true
            },
            confirm: {
                field: 'confirm',
                type: DataTypes.UUID,
                allowNull: false,
                unique: true
            },
            request_data: {
                field: 'request_data',
                type: DataTypes.DATE,
                allowNull: false,
                unique: true
            },

            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'updated_at'
            }
        }, {
            underscored: true,
            tableName: 'banks',
            classMethods: {
                associate: function (models) {
                    this.belongsTo(models['User'].scope('plain'), {as: 'User', foreignKey: 'userId'});
                    this.belongsTo(models['Image'], {foreignKey: 'logo_id', as: 'Logo', required: false});
                }
            },
            defaultScope: [
                {
                    attributes: {exclude: ['billingData']}
                }
            ],
            scopes: {
                general : {
                    attributes: {
                        exclude: ['billingData']
                    }
                }
            },
            scopedIncludes: {
                general: [
                    {model: 'Image', as: 'Logo', required: false},
                ],
                withUser: [
                    {model: 'Image', as: 'Logo', required: false},
                    {model: 'User', as: 'User', required: true},
                ]
            }
        }),

        /**@typedef {{}} BankRating*/
        sequelize.define('BankRating', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            bankId: {
                field: 'bank_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            clientId: {
                field: 'client_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            contractId: {
                field: 'contract_id',
                type: DataTypes.UUID,
                allowNull: false
            },
            rating: {
                type: DataTypes.JSONB,
                defaultValue: [],
                allowNull: false,
                validate: {
                    isRatingsArray: /**{type:String,value:Number}[]*/value=> {
                        if (!Array.isArray(value)) {
                            throw new Error('Malformed rating JSON');
                        }
                        let isValid = value.reduce((isValid, elem)=> {
                            let keys = Object.keys(elem);
                            if (keys.length !== 2) {
                                return false;
                            }
                            return isValid && (typeof elem.type === 'string') && (typeof elem.value === 'number') && (elem.value >= 0 && elem.value <= 5);
                        }, true);
                        if (!isValid) {
                            throw new Error('Malformed rating JSON');
                        }
                    }
                }
            },
            comment: {
                type: DataTypes.TEXT,
                defaultValue: '',
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'updated_at'
            }
        }, {
            underscored: true,
            tableName: 'bank_ratings',
            classMethods: {
                associate: function (models) {
                    this.belongsTo(models['Bank'], {foreignKey: 'bank_id'});
                    this.belongsTo(models['Client'], {foreignKey: 'client_id'});
                }
            }
        })
    ]
};