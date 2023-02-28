
import {InterfaceError} from "../InterfaceError.js";


InterfaceError.consoleNotification = true

//InterfaceData.addGlobalEndPoints(InterfaceError)


/**
 * @alias ErrorTypes
 * @namespace
 */



/**
 * @var consoleGroup
 *  Template for the header of grouped error messages
 */
InterfaceError.template('consoleGroup','{$type}:{$message}')

/**
 * @var  consoleMessage
 * Console message template */
InterfaceError.template('consoleMessage', '{$message}')

/** Template for errors when no error is defined */
InterfaceError.template('default','{$type}: {$entryPoints} - {$message}{$errors}')

/**
 * @var  BadCriteria
 * An error is thrown in the following cases:
 * -  when forming an interface member, if the object for the criteria does not match the criteria template
 * ([template  .PropertyCriteria], [template .CriteriaMethodType], [template .CriteriaReactType])
 * - Criteria are not comparable when comparing interfaces
 */
InterfaceError.template('BadCriteria', '{$type}: {$entryPoints} - Criteria must meet [object {$className}].')

/**
 * @var Init_BadIncludesOrExcludes
 * An error is thrown in the following cases:
 * - when forming an interface member, if the criteria "includes" or "excludes" are incorrect
 *
 * Accompanied by errors: {@link ...InitIncludes},  {@link ...InitExcludes}
 */
//InterfaceError.template('Init_BadIncludesOrExcludes', '') // "{$type}: {$entryPoints} - {$errors}"

/**
 * @var BadTypes
 * An error is thrown in the following cases:
 * - when forming an interface member, if the passed types for the criteria are not correct.
 *
 * Groups errors of all invalid types
 *
 * Accompanied by errors: {@link ...InitTypes_badType}
 *
 */
//InterfaceError.template('BadTypes', '')

/**
 * @var BadType_Incorrect
 * An error is thrown in the following cases:
 * -when forming an interface member, if an inappropriate type is passed.
 */

InterfaceError.template('BadType_Incorrect', '{$type}: {$entryPoints} - Invalid parameter passed [{$dataType}].')
InterfaceError.template('BadType_Duplicate', '{$type}: {$entryPoints} - duplicate type [{$dataType}].')

/**
 * @var InitIncludes
 * An error is thrown in the following cases:
 *  - when forming an interface member,  if the passed "includes" values for the criteria are not correct.
 *
 *  Groups errors of all invalid "includes" values.
 *
 *  Accompanied by errors: {@link ...ValidateData}
 */

//InterfaceError.template('InitIncludes', '')
/**
 * @var InitExcludes
 * An error is thrown in the following cases:
 *  - when forming an interface member,  if the passed "excludes" values ​​for the criteria are not correct.
 *
 * Groups errors of all invalid "excludes" values.
 *
 * Accompanied by errors:  {@link ...ValidateData}
 */
//InterfaceError.template('InitExcludes', '')
/**
 * @var Init_BadArgumentsOrReturn
 * An error is thrown in the following cases:
 *  - when forming an interface member (method), if the criteria for arguments and/or return values ​​are not correct
 *
 *  Groups errors.
 *
 * Accompanied by errors: {@link ...BadCriteria} {@link ...InitTypes} {@link ...Init_BadIncludesOrExcludes}
 */
//InterfaceError.template('Init_BadArgumentsOrReturn', '')
/**
 *
 * @var Validate
 * An error is thrown in the following cases:
 * - When checking class members for an interface (matching criteria),
 * if the member value (property, method arguments, method return values,
 * reactive properties) does not meet the criteria
 * Groups errors the criteria
 *
 * Accompanied by errors: {@link ...ValidateInIncludes}, {@link ...validateInExcludes}
 */
//InterfaceError.template('Validate', '')

/**
 * @var ValidateData
 * An error is thrown in the following cases:
 * -  When validate class members according to interface criteria , If the value does not match the types from the interface criteria
 *
 * Accompanied by errors:  {@link ...Validate_BadMirrorProperties} (if one of the types is extends [class  .MirrorInterface])
 */
InterfaceError.template('ValidateData', '{$type}: {$entryPoints} - Expected type of "{$expectedTypes}"  but defined by "{$definedType}".{$errors}')

/**
 * @var ValidateInIncludes
 * An error is thrown in the following cases:
 * -When validate class members according to interface criteria , if the value does not match the value on the "includes" stack
 */
InterfaceError.template('ValidateInIncludes', "{$type}: {$entryPoints} - \"{$value}\" is not present in 'includes' stack")

/**
 * @var ValidateInExcludes
 * An error is thrown in the following cases:
 *  -When validate class members according to interface criteria , if the value matches one of the values ​​on the "excludes" stack
 */
InterfaceError.template('ValidateInExcludes', "{$type}: {$entryPoints} - \"{$value}\" is present in 'excludes' stack")

/**
 * @var ValidateMethodDeclared
 * An error is thrown in the following cases:
 * -When validated  class members from criteria, if class member is not a method.
 */
InterfaceError.template('ValidateMethodDeclared', '{$type}: {$entryPoints} - The property must be Function.')

/**
 * @var ValidateArguments
 * An error is thrown in the following cases:
 *  -When validation the arguments of the class methods according to the interface criteria, if the argument does not meet the criteria.
 *
 *  Groups errors for arguments
 *
 *  Accompanied by errors:  {@link ...Validate}, {@link ...ValidateData}
 */
//InterfaceError.template('ValidateArguments', '')

/**
 * @var ValidateReactDeclared
 *  An error is thrown in the following cases:
 *  -when validated the reactive property values ​​,if getter / setter should be declared or not declared,
 *  - when a reactive property is to be declared.
 */
InterfaceError.template('ValidateReactDeclared', '{$type}: {$entryPoints} - "{$react_type}" {$not} must be declared')

/**
 * @var ValidateMemberDeclared
 * An error is thrown in the following cases:
 * -When validated  class members from criteria, if there is no member in the class.
 */
InterfaceError.template('ValidateMemberDeclared', '{$type}: {$entryPoints} - The member must be declared.')

/**
 * @var Validate_BadMembers
 * An error is thrown in the following cases:
 * -when the class fails validation.
 *
 * Groups errors
 *
 * Accompanied by errors:
 * {@link ...ValidateMemberDeclared},
 * {@link ...ValidateReactDeclared},
 * {@link ...ValidateMethodDeclared},
 * {@link ...Validate}
 * {@link ...ValidateData}
 */
//InterfaceError.template('Validate_BadMembers', '')

/**
 * @var Validate_BadMirrorProperties
 * An error is thrown in the following cases:
 * -When a class or object is validated against  mirror interface.
 *
 * Accompanied by errors: {@link ...Validate_BadMembers}
 */
//InterfaceError.template('Validate_BadMirrorProperties', '')

/**
 * @var Compare
 * An error is thrown in the following cases:
 * -When comparing criteria for interface members,if the interfaces do not match the criteria
 *
 * Groups errors the criteria when compare
 *
 * Accompanied by errors:  {@link ...CompareIncludes}, {@link ...CompareExcludes}
 */
//InterfaceError.template('Compare', '')

/**
 * @var CompareTypes
 * An error is thrown in the following cases:
 * - When comparing criteria for interface members, if the criteria "types" do not match
 */
InterfaceError.template('CompareTypes', '{$type}: {$entryPoints} - not matching stacks "types"')// "{$type}: {$entryPoints} - type \"{$value}\" is not present in 'types' stack",

/**
 * @var CompareIncludes
 * An error is thrown in the following cases:
 * - When comparing criteria for interface members, if the criteria "includes" do not match
 */
InterfaceError.template('CompareIncludes', '{$type}: {$entryPoints} - not matching stacks "includes"')

/**
 * @var CompareExcludes
 * An error is thrown in the following cases:
 * - When comparing criteria for interface members, if the criteria "excludes" do not match
 */
InterfaceError.template('CompareExcludes', '{$type}: {$entryPoints} - not matching stacks "excludes"')

/**
 * @var CompareMethod
 *  An error is thrown in the following cases:
 *  -When comparing criteria for interface members, if in the method the arguments or return do not match the rules of the matched interface
 *
 */
//InterfaceError.template('CompareMethod', '')

/**
 * @var CompareReact
 *  An error is thrown in the following cases:
 *  - if getter or setter is not declared or criteria are not matched.
 */
//InterfaceError.template('CompareReact', '')


/**
 * @var ImplementInterfaceError
 * An error is thrown in the following cases:
 * - When  [method .InterfaceBuilder.implementInterfaces] is called and the first argument is an interface.
 * Build and validation happens only for classes.
 */
//InterfaceError.template('ImplementInterfaceError', '')
